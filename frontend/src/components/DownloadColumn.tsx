import React from 'react';
import { Download, Film, Music, Sparkles } from 'lucide-react';

export interface FormatItem {
  format_id: string;
  ext: string;
  quality: string;
  filesize: string;
  direct_url?: string;
  download_url?: string;
  note?: string;
  resolution?: string;
  fps?: number;
  type?: 'audio' | 'video';
  needs_merge?: boolean;
}

interface DownloadColumnProps {
  title: string;
  type: 'audio' | 'video';
  badgeText: string;
  formats: FormatItem[];
  onSelectFormat: (fmt: FormatItem) => void;
}

export default function DownloadColumn({ title, type, badgeText, formats, onSelectFormat }: DownloadColumnProps) {
  return (
    <div className="bg-platinum p-4 rounded-sm bevel-card space-y-3">
      {/* Column Header */}
      <div className="flex items-center justify-between border-b-2 border-chrome-indigo pb-2">
        <h3 className="text-xs font-bold text-carbon uppercase tracking-wider flex items-center gap-1.5">
          {type === 'audio' ? <Music className="w-3.5 h-3.5 text-signal" /> : <Film className="w-3.5 h-3.5 text-chrome-indigo" />}
          <span>{title}</span>
        </h3>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${type === 'audio' ? 'bg-amber text-carbon' : 'bg-signal text-white'}`}>
          {badgeText}
        </span>
      </div>

      {/* Inset Bevel Cards List */}
      <div className="space-y-2">
        {formats.map((fmt, idx) => (
          <div
            key={idx}
            className="bg-surface p-2.5 rounded-sm bevel-inset flex items-center justify-between gap-2 hover:bg-sky/20 transition-colors"
          >
            <div>
              <div className="text-xs font-bold text-carbon flex items-center gap-1">
                <span className={`uppercase font-black ${type === 'audio' ? 'text-signal' : 'text-chrome-indigo'}`}>
                  {fmt.ext}
                </span>
                <span>•</span>
                <span className="font-bold">{fmt.resolution || fmt.quality}</span>
                {fmt.needs_merge && (
                  <span className="text-[9px] bg-amber text-carbon px-1 rounded font-pixel flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> HD
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                Tamanho: {fmt.filesize} {fmt.fps ? `(${fmt.fps} fps)` : ''} {fmt.note ? `| ${fmt.note}` : ''}
              </div>
            </div>

            {/* Click to open Modal Preview & Direct Download */}
            <button
              onClick={() => onSelectFormat(fmt)}
              className={`${
                type === 'audio' ? 'bg-amber text-carbon' : 'bg-signal text-white'
              } font-bold text-xs px-3 py-1.5 rounded-sm bevel-card flex items-center gap-1.5 shadow-bevel-btn active:translate-y-0.5`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>PREVIEW / BAIXAR</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
