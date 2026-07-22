import React from 'react';
import { HardDrive, Play, Copy, Trash2, RotateCcw } from 'lucide-react';

export interface HistoryBlock {
  id: number | string;
  title: string;
  url: string;
  platform?: string;
  timestamp?: string;
}

interface MemoryCardPanelProps {
  history: HistoryBlock[];
  onLoadUrl: (url: string) => void;
  onDeleteItem: (id: number | string) => void;
  onClearAll: () => void;
  playClick?: () => void;
}

export default function MemoryCardPanel({ history, onLoadUrl, onDeleteItem, onClearAll, playClick }: MemoryCardPanelProps) {
  const maxBlocks = 15;
  const usedBlocks = history.length;

  const handleCopy = (url: string) => {
    playClick?.();
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="w-full bg-[#242836] border-4 border-[#14161f] rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden font-mono text-white select-none">
      
      {/* Memory Card Top Header */}
      <div className="bg-[#181a24] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#3d4f97]">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#ecab37]" />
          <span className="text-xs font-bold tracking-wider text-[#9fbee7] uppercase font-pixel">
            MEMORY CARD 8MB // SLOT 1
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#0e1017] px-2.5 py-1 rounded border border-[#3d4f97]">
          <span className={`w-2.5 h-2.5 rounded-full ${usedBlocks > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
          <span className="text-[11px] font-bold text-[#ecab37] font-pixel">
            SLOT 1: {usedBlocks}/{maxBlocks} BLOCKS USED
          </span>
        </div>
      </div>

      {/* Save Blocks Grid */}
      <div className="p-4">
        {history.length === 0 ? (
          <div className="py-8 text-center text-gray-400 bg-[#1a1c26] rounded border-2 border-dashed border-[#3d4f97] space-y-1">
            <p className="text-xs font-bold text-[#8ba1d4] font-pixel">NENHUM BLOCO DE DADOS GRAVADO</p>
            <p className="text-[11px] text-gray-400 font-sans">Busque mídias no mobyP3 para gravar o histórico no Memory Card!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item, index) => (
              <div 
                key={item.id || index}
                className="bg-[#32384a] border-2 border-[#10121a] rounded p-2.5 flex flex-col justify-between shadow-[inset_1px_1px_0px_rgba(255,255,255,0.1)] hover:border-[#f68d1f] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[9px] bg-[#181a24] text-[#ecab37] px-1.5 py-0.5 rounded border border-black font-bold uppercase truncate font-pixel">
                      {item.platform || 'MIDIA'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold font-pixel">
                      BLOCK #{index + 1}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight mb-2 font-sans" title={item.title}>
                    {item.title || item.url}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#444c64]">
                  <button
                    onClick={() => { playClick?.(); onLoadUrl(item.url); }}
                    className="flex-1 bg-[#3d4f97] hover:bg-[#4d62b5] text-white text-[10px] font-bold py-1 px-2 rounded border border-black shadow-[1px_1px_0px_#000] active:translate-y-0.5 uppercase flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 text-amber" />
                    <span>[▶ RECARREGAR]</span>
                  </button>
                  
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="bg-[#ecab37] hover:bg-[#f68d1f] text-[#12141c] text-[10px] font-bold px-2 py-1 rounded border border-black shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                    title="Copiar Link"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => { playClick?.(); onDeleteItem(item.id); }}
                    className="bg-[#e11d48] hover:bg-[#f43f5e] text-white text-[10px] font-bold px-2 py-1 rounded border border-black shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                    title="Apagar Bloco"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Format Card Option */}
        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#3d4f97] flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-sans">Gravado via LocalStorage</span>
            <button
              onClick={() => { playClick?.(); onClearAll(); }}
              className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer flex items-center gap-1 font-pixel text-[10px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>[FORMATAR CARD (LIMPAR TUDO)]</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
