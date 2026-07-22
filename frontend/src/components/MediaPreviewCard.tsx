import React, { useState } from 'react';
import { Play, Pause, Volume2, ExternalLink } from 'lucide-react';

interface MediaPreviewCardProps {
  media: {
    title: string;
    thumbnail: string;
    duration: string;
    uploader: string;
    webpage_url: string;
    audio_preview_url?: string;
  };
}

export default function MediaPreviewCard({ media }: MediaPreviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audioElement = document.getElementById('moby-audio-preview') as HTMLAudioElement;
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start border-b-2 border-platinum pb-4">
      {/* Thumbnail with Chrome Indigo Border */}
      <div className="relative w-full sm:w-56 h-36 bg-carbon rounded-sm overflow-hidden border-2 border-chrome-indigo flex-shrink-0 group shadow-md">
        <img
          src={media.thumbnail}
          alt={media.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <span className="absolute bottom-1 right-1 bg-carbon/90 text-white font-pixel text-[10px] px-1.5 py-0.5 rounded border border-white/20">
          {media.duration}
        </span>
      </div>

      {/* Info & Audio Preview Player */}
      <div className="flex-1 space-y-2.5">
        <div className="inline-block bg-carbon text-amber font-pixel text-[10px] px-2 py-0.5 rounded uppercase">
          Mídia Pronta para Extração
        </div>

        <h2 className="text-base sm:text-lg font-bold text-carbon leading-snug">
          {media.title}
        </h2>

        <p className="text-xs text-chrome-indigo font-bold flex items-center gap-1">
          <span>Canal / Autor:</span>
          <span className="text-carbon font-normal">{media.uploader}</span>
        </p>

        {/* Audio Sample Preview Controls */}
        {media.audio_preview_url && (
          <div className="bg-platinum p-2 rounded-sm bevel-inset flex items-center gap-3 max-w-sm">
            <audio
              id="moby-audio-preview"
              src={media.audio_preview_url}
              onEnded={() => setIsPlaying(false)}
              preload="none"
            />
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-signal text-white flex items-center justify-center shadow-bevel-btn hover:bg-signal/90"
              title="Pré-escutar áudio"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="text-[11px] font-bold text-carbon flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-chrome-indigo" />
              <span>{isPlaying ? 'Tocando Prévia...' : 'Pré-escutar Áudio (Sample)'}</span>
            </div>
          </div>
        )}

        <div>
          <a
            href={media.webpage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-signal font-bold hover:underline"
          >
            <span>Abrir link original</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
