import React, { useState, useEffect } from 'react';
import { Music, Video, Image as ImageIcon, Download, Sparkles, RefreshCw, Zap, Sliders } from 'lucide-react';

export type MediaTypeCategory = 'audio' | 'video' | 'thumbnail';
export type AudioFXPreset = 'none' | 'chiptune' | 'nightcore' | 'radio' | 'bassboost';

export interface ProcessOptions {
  media_type: MediaTypeCategory;
  format: 'mp3' | 'm4a' | 'mp4' | 'webp' | 'jpg' | 'png';
  quality: '320' | '128' | 'native' | '1080p' | '720p' | '480p' | '360p' | 'best';
  audio_fx?: AudioFXPreset;
}

interface ExtractorUIProps {
  url: string;
  backendUrl: string;
  mediaTitle?: string;
  detectedVideoFormats?: { format_id: string; resolution?: string; quality?: string }[];
  onTriggerToast: (msg: string) => void;
  playClick?: () => void;
}

export default function ExtractorUI({ url, backendUrl, mediaTitle, detectedVideoFormats, onTriggerToast, playClick }: ExtractorUIProps) {
  const [activeCategory, setActiveCategory] = useState<MediaTypeCategory>('video');
  
  // Format Selection State
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'm4a'>('mp3');
  const [audioQuality, setAudioQuality] = useState<'320' | '128' | 'native'>('320');
  const [audioFx, setAudioFx] = useState<AudioFXPreset>('none');

  const [videoQuality, setVideoQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [imageFormat, setImageFormat] = useState<'webp' | 'jpg' | 'png'>('webp');

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Set default video quality based on detected formats from backend
  useEffect(() => {
    if (detectedVideoFormats && detectedVideoFormats.length > 0) {
      const topRes = detectedVideoFormats[0].resolution || detectedVideoFormats[0].quality || '';
      if (topRes.includes('1080')) setVideoQuality('1080p');
      else if (topRes.includes('720')) setVideoQuality('720p');
      else if (topRes.includes('480') || topRes.includes('360')) setVideoQuality('480p');
    }
  }, [detectedVideoFormats]);

  const handleSelectCategory = (cat: MediaTypeCategory) => {
    if (playClick) playClick();
    setActiveCategory(cat);
  };

  const handleProcessDownload = async () => {
    if (playClick) playClick();
    if (!url.trim()) {
      onTriggerToast("Por favor, informe uma URL válida.");
      return;
    }

    setIsProcessing(true);
    setDownloadProgress(25);

    let formatParam: ProcessOptions['format'] = 'mp3';
    let qualityParam: ProcessOptions['quality'] = '320';

    if (activeCategory === 'audio') {
      formatParam = audioFormat;
      qualityParam = audioQuality;
    } else if (activeCategory === 'video') {
      formatParam = 'mp4';
      qualityParam = videoQuality;
    } else if (activeCategory === 'thumbnail') {
      formatParam = imageFormat;
      qualityParam = 'best';
    }

    const fxLabel = audioFx !== 'none' ? ` [FX: ${audioFx.toUpperCase()}]` : '';
    onTriggerToast(`Iniciando extração [${activeCategory.toUpperCase()}: ${formatParam.toUpperCase()} ${qualityParam}]${fxLabel}...`);

    const apiBase = backendUrl.replace(/\/$/, '');

    try {
      setDownloadProgress(50);
      const res = await fetch(`${apiBase}/api/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          media_type: activeCategory,
          format: formatParam,
          quality: qualityParam,
          audio_fx: audioFx
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Falha ao processar arquivo no servidor.");
      }

      setDownloadProgress(85);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      
      const ext = formatParam;
      const cleanTitle = `mobyP3_${activeCategory}_${Date.now()}.${ext}`;
      
      const contentDisposition = res.headers.get('Content-Disposition');
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
          a.download = match[1];
        } else {
          a.download = cleanTitle;
        }
      } else {
        a.download = cleanTitle;
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      setDownloadProgress(100);
      onTriggerToast(`Download de ${formatParam.toUpperCase()} concluído com sucesso!`);
    } catch (err: any) {
      onTriggerToast(`Erro ao processar: ${err.message || 'Falha de conexão'}`);
    } finally {
      setIsProcessing(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="bg-periwinkle p-4 sm:p-5 rounded-md bevel-chassis shadow-hard-drop space-y-4 max-w-full overflow-x-hidden border-2 border-chrome-indigo">
      
      {/* Header Dip Switch Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-chrome-indigo pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-signal" />
          <h2 className="text-xs font-bold text-carbon uppercase tracking-wider font-sans">
            DIP SWITCH — SELETOR DE MÍDIA & QUALIDADE
          </h2>
        </div>
        <span className="text-[10px] font-pixel bg-amber text-carbon px-2 py-0.5 rounded border border-carbon font-bold">
          {mediaTitle ? 'MÍDIA RECONHECIDA' : 'CONFIGURAÇÃO PRÉVIA'}
        </span>
      </div>

      {mediaTitle && (
        <div className="bg-surface px-3 py-2 rounded border border-chrome-indigo text-xs font-bold text-carbon flex items-center justify-between">
          <span className="truncate max-w-md">🎵 {mediaTitle}</span>
          <span className="text-[10px] text-green-700 font-pixel bg-green-100 px-2 py-0.5 rounded">PRONTO PARA EXTRAÇÃO</span>
        </div>
      )}

      {/* Category Tabs (Audio / Video / Thumbnail) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleSelectCategory('video')}
          className={`min-h-[48px] px-3 py-2 rounded-sm bevel-card font-bold text-xs flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider ${
            activeCategory === 'video'
              ? 'bg-signal text-white shadow-bevel-btn ring-2 ring-carbon'
              : 'bg-carbon text-gray-300 hover:bg-carbon/80'
          }`}
        >
          <Video className="w-4 h-4 text-amber" />
          <span className="truncate">🎬 VÍDEO</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory('audio')}
          className={`min-h-[48px] px-3 py-2 rounded-sm bevel-card font-bold text-xs flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider ${
            activeCategory === 'audio'
              ? 'bg-amber text-carbon shadow-bevel-btn ring-2 ring-carbon'
              : 'bg-carbon text-gray-300 hover:bg-carbon/80'
          }`}
        >
          <Music className="w-4 h-4 text-signal" />
          <span className="truncate">🎵 ÁUDIO</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory('thumbnail')}
          className={`min-h-[48px] px-3 py-2 rounded-sm bevel-card font-bold text-xs flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider ${
            activeCategory === 'thumbnail'
              ? 'bg-cyan-600 text-white shadow-bevel-btn ring-2 ring-carbon'
              : 'bg-carbon text-gray-300 hover:bg-carbon/80'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber" />
          <span className="truncate">🖼️ CAPA</span>
        </button>
      </div>

      {/* Options Panel per Category */}
      <div className="bg-surface p-4 rounded-sm bevel-inset space-y-4">
        
        {/* CATEGORY: VIDEO OPTIONS */}
        {activeCategory === 'video' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-carbon uppercase flex items-center justify-between">
              <span>Resolução Detectada (MP4 com Áudio Sincronizado):</span>
              <span className="text-[10px] text-amber font-pixel">Mesclagem FFmpeg On-the-Fly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setVideoQuality('1080p'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  videoQuality === '1080p'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  <span>MP4 1080p</span>
                  <span className="bg-amber text-carbon text-[9px] px-1 rounded font-pixel">FHD</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Alta Definição 1080p</span>
              </button>

              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setVideoQuality('720p'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  videoQuality === '720p'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  <span>MP4 720p</span>
                  <span className="bg-signal text-white text-[9px] px-1 rounded font-pixel">HD</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Qualidade HD Padrão</span>
              </button>

              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setVideoQuality('480p'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  videoQuality === '480p'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  <span>MP4 480p / 360p</span>
                  <span className="bg-gray-600 text-white text-[9px] px-1 rounded font-pixel">SD</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Econômico / Celular</span>
              </button>
            </div>
          </div>
        )}

        {/* CATEGORY: AUDIO OPTIONS & RETRO FX SYNTHESIZER */}
        {activeCategory === 'audio' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-carbon uppercase flex items-center justify-between">
              <span>Formato & Taxa de Bits (Bitrate):</span>
              <span className="text-[10px] text-signal font-pixel">ID3 Tag + Capa Embutida</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setAudioFormat('mp3'); setAudioQuality('320'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  audioFormat === 'mp3' && audioQuality === '320'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span className="text-signal">MP3</span>
                  <span>• 320 kbps</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Qualidade Máxima (HD)</span>
              </button>

              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setAudioFormat('mp3'); setAudioQuality('128'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  audioFormat === 'mp3' && audioQuality === '128'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span className="text-signal">MP3</span>
                  <span>• 128 kbps</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Tamanho Reduzido</span>
              </button>

              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setAudioFormat('m4a'); setAudioQuality('native'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  audioFormat === 'm4a'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span className="text-chrome-indigo">M4A</span>
                  <span>• AAC Nativo</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Sem re-encoding</span>
              </button>
            </div>

            {/* RETRO AUDIO FX SYNTHESIZER SELECTOR */}
            <div className="pt-3 border-t border-gray-300 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-chrome-indigo uppercase font-pixel">
                <Sliders className="w-4 h-4 text-signal" />
                <span>FILTRO / SINTETIZADOR DE ÁUDIO RETRÔ:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => { if (playClick) playClick(); setAudioFx('none'); }}
                  className={`min-h-[44px] px-2 py-1.5 rounded text-[11px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    audioFx === 'none'
                      ? 'bg-carbon text-white border-carbon shadow-sm'
                      : 'bg-canvas text-gray-700 border-gray-300 hover:border-chrome-indigo'
                  }`}
                >
                  <span>🎵 Padrão</span>
                  <span className="text-[9px] text-gray-400 font-normal">Original</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (playClick) playClick(); setAudioFx('chiptune'); }}
                  className={`min-h-[44px] px-2 py-1.5 rounded text-[11px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    audioFx === 'chiptune'
                      ? 'bg-amber text-carbon border-black shadow-sm font-pixel'
                      : 'bg-canvas text-gray-700 border-gray-300 hover:border-amber'
                  }`}
                >
                  <span>🕹️ Chiptune</span>
                  <span className="text-[9px] text-carbon/80 font-normal">8-Bit Game</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (playClick) playClick(); setAudioFx('nightcore'); }}
                  className={`min-h-[44px] px-2 py-1.5 rounded text-[11px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    audioFx === 'nightcore'
                      ? 'bg-signal text-white border-carbon shadow-sm'
                      : 'bg-canvas text-gray-700 border-gray-300 hover:border-signal'
                  }`}
                >
                  <span>⚡ Nightcore</span>
                  <span className="text-[9px] text-white/80 font-normal">1.25x Speed</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (playClick) playClick(); setAudioFx('radio'); }}
                  className={`min-h-[44px] px-2 py-1.5 rounded text-[11px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    audioFx === 'radio'
                      ? 'bg-chrome-indigo text-white border-carbon shadow-sm'
                      : 'bg-canvas text-gray-700 border-gray-300 hover:border-chrome-indigo'
                  }`}
                >
                  <span>📻 Rádio 90s</span>
                  <span className="text-[9px] text-white/80 font-normal">Filtro AM/FM</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (playClick) playClick(); setAudioFx('bassboost'); }}
                  className={`min-h-[44px] px-2 py-1.5 rounded text-[11px] font-bold border transition-all flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 ${
                    audioFx === 'bassboost'
                      ? 'bg-red-600 text-white border-carbon shadow-sm'
                      : 'bg-canvas text-gray-700 border-gray-300 hover:border-red-600'
                  }`}
                >
                  <span>💥 Bass Boost</span>
                  <span className="text-[9px] text-white/80 font-normal">Graves Extra</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* CATEGORY: THUMBNAIL / CAPA OPTIONS */}
        {activeCategory === 'thumbnail' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-carbon uppercase flex items-center justify-between">
              <span>Formato da Imagem de Capa (Thumbnail HD/4K):</span>
              <span className="text-[10px] text-cyan-600 font-pixel">Download Direto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setImageFormat('webp'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  imageFormat === 'webp'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black flex items-center justify-between">
                  <span>WebP (Otimizado)</span>
                  <Sparkles className="w-3.5 h-3.5 text-signal" />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Comprimido sem perda</span>
              </button>

              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setImageFormat('jpg'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  imageFormat === 'jpg'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black">JPG (Padrão)</div>
                <span className="text-[10px] text-gray-500 font-medium">Compatibilidade Total</span>
              </button>

              <button
                type="button"
                onClick={() => { if (playClick) playClick(); setImageFormat('png'); }}
                className={`min-h-[48px] p-2.5 rounded-sm border-2 text-left flex flex-col justify-center transition-all ${
                  imageFormat === 'png'
                    ? 'border-signal bg-signal/10 text-carbon font-bold'
                    : 'border-gray-300 bg-canvas text-gray-700 hover:border-chrome-indigo'
                }`}
              >
                <div className="text-xs font-black">PNG Ultra</div>
                <span className="text-[10px] text-gray-500 font-medium">Alta Resolução</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROCESS & DOWNLOAD CTA BUTTON */}
      <button
        type="button"
        onClick={handleProcessDownload}
        disabled={isProcessing || !url.trim()}
        className="w-full min-h-[48px] bg-signal hover:bg-signal/90 active:translate-y-0.5 text-white font-bold text-sm py-3 px-4 rounded-sm bevel-card flex items-center justify-center gap-2 shadow-bevel-btn uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>⏳ PROCESSANDO E EXTRAINDO ({downloadProgress}%)...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>
              BAIXAR AGORA [{activeCategory.toUpperCase()}: {activeCategory === 'audio' ? `${audioFormat.toUpperCase()} ${audioQuality}` : activeCategory === 'video' ? `MP4 ${videoQuality}` : imageFormat.toUpperCase()}]
            </span>
          </>
        )}
      </button>
    </div>
  );
}
