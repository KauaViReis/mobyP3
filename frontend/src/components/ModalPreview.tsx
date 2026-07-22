import React, { useState } from 'react';
import { X, Download, RefreshCw, Volume2, Film, Scissors, Image as ImageIcon, FileText } from 'lucide-react';
import { FormatItem } from './DownloadColumn';

interface SubtitleItem {
  language: string;
  ext: string;
  url: string;
}

interface ModalPreviewProps {
  mediaTitle: string;
  thumbnail: string;
  maxresThumbnail?: string;
  previewVideoUrl?: string;
  webpageUrl: string;
  format: FormatItem;
  subtitles?: SubtitleItem[];
  onClose: () => void;
  onTriggerToast: (msg: string) => void;
}

export default function ModalPreview({
  mediaTitle,
  thumbnail,
  maxresThumbnail,
  previewVideoUrl,
  webpageUrl,
  format,
  subtitles = [],
  onClose,
  onTriggerToast
}: ModalPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Trimming State (Option B)
  const [activeTab, setActiveTab] = useState<'preview' | 'trim' | 'extras'>('preview');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);

  const isVideo = format.type === 'video' || format.ext === 'mp4';
  const cleanFileName = `mobyP3_${mediaTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${format.resolution || 'media'}.${format.ext}`;
  const playerSrc = isVideo ? (previewVideoUrl || format.direct_url) : format.direct_url;

  // Option B: Handle Trimming Endpoint
  const handleTrimDownload = async () => {
    if (endTime <= startTime) {
      onTriggerToast("Tempo final deve ser maior que o tempo inicial.");
      return;
    }

    setDownloading(true);
    setIsDownloading(true);
    onTriggerToast(`Cortando trecho de ${startTime}s até ${endTime}s...`);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/trim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webpageUrl,
          start_time: Number(startTime),
          end_time: Number(endTime),
          ext: format.ext === 'mp3' ? 'mp3' : 'mp4'
        })
      });

      if (!res.ok) throw new Error("Erro ao recortar mídia");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `mobyP3_corte_${startTime}s-${endTime}s.${format.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      onTriggerToast("Trecho cortado com sucesso!");
    } catch {
      onTriggerToast("Erro ao processar corte do áudio/vídeo.");
    } finally {
      setDownloading(false);
      setIsDownloading(false);
    }
  };

  // Option A & Full Download
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloading(true);
    setDownloadProgress(20);

    const targetUrl = format.direct_url || webpageUrl;

    if (format.needs_merge) {
      onTriggerToast(`Iniciando mesclagem HD (${format.resolution}) no servidor...`);
      setDownloadProgress(50);

      try {
        const res = await fetch('http://127.0.0.1:8000/api/download-merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webpageUrl,
            format_id: format.format_id,
            resolution: format.resolution
          })
        });

        if (!res.ok) throw new Error("Erro na mesclagem");

        const blob = await res.blob();
        setDownloadProgress(90);

        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);

        onTriggerToast(`Vídeo ${format.resolution} baixado com áudio!`);
      } catch {
        // Fallback to /api/download endpoint fetch
        try {
          const downloadApiUrl = `http://127.0.0.1:8000/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(cleanFileName)}`;
          const res = await fetch(downloadApiUrl);
          if (!res.ok) throw new Error("Erro no download direto");

          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = cleanFileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);

          onTriggerToast(`Vídeo baixado diretamente!`);
        } catch (err: any) {
          onTriggerToast(`Erro ao baixar: ${err.message || 'Falha no download'}`);
        }
      } finally {
        setDownloading(false);
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    } else {
      try {
        setDownloadProgress(40);
        if (!targetUrl) throw new Error("URL direta não disponível");

        const downloadApiUrl = `http://127.0.0.1:8000/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(cleanFileName)}`;
        const res = await fetch(downloadApiUrl);
        setDownloadProgress(75);

        if (!res.ok) {
          // Fallback to direct fetch
          const directRes = await fetch(targetUrl);
          if (!directRes.ok) throw new Error("Não foi possível acessar o arquivo de mídia");
          const blob = await directRes.blob();
          setDownloadProgress(95);

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = cleanFileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);

          onTriggerToast(`Arquivo "${cleanFileName}" salvo!`);
          return;
        }

        const blob = await res.blob();
        setDownloadProgress(95);

        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);

        onTriggerToast(`Arquivo "${cleanFileName}" salvo com sucesso!`);
      } catch (err: any) {
        onTriggerToast(`Falha ao baixar mídia: ${err.message || 'Erro de conexão'}`);
      } finally {
        setDownloading(false);
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-signal selection:text-white animate-fade-in">
      
      <div className="bg-periwinkle max-w-2xl w-full rounded-md bevel-chassis shadow-2xl overflow-hidden">
        
        {/* Header Bar with Tabs */}
        <div className="bg-halftone text-surface p-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-chrome-indigo">
          <div className="flex items-center gap-2">
            <div className="bg-surface text-primary px-3 py-0.5 rounded-full font-display font-black text-sm border border-primary">
              <span className="text-chrome-indigo">moby</span>
              <span className="text-primary italic">P3</span>
            </div>
            <div className="flex items-center gap-1 font-pixel text-[10px]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2 py-1 rounded ${activeTab === 'preview' ? 'bg-signal text-white' : 'bg-carbon text-gray-300'}`}
              >
                🎮 PREVIEW
              </button>
              <button
                onClick={() => setActiveTab('trim')}
                className={`px-2 py-1 rounded ${activeTab === 'trim' ? 'bg-amber text-carbon' : 'bg-carbon text-gray-300'}`}
              >
                ✂️ RECORTAR
              </button>
              <button
                onClick={() => setActiveTab('extras')}
                className={`px-2 py-1 rounded ${activeTab === 'extras' ? 'bg-cyan-600 text-white' : 'bg-carbon text-gray-300'}`}
              >
                🖼️ CAPAS/LEGENDAS
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3 py-1 rounded-sm bevel-card flex items-center gap-1 shadow-bevel-btn"
          >
            <X className="w-4 h-4" />
            <span>[ X ] FECHAR</span>
          </button>
        </div>

        {/* Modal Content Tabs */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <>
              <div className="bg-carbon rounded-sm border-2 border-chrome-indigo overflow-hidden shadow-inner relative flex flex-col items-center justify-center min-h-[220px]">
                {isVideo ? (
                  <video
                    controls
                    autoPlay
                    poster={thumbnail}
                    src={playerSrc}
                    className="w-full max-h-[300px] object-contain bg-black"
                  >
                    Seu navegador não suporta a reprodução.
                  </video>
                ) : (
                  <div className="p-6 text-center space-y-4 w-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-chrome-indigo rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-amber">
                      <Volume2 className="w-10 h-10 text-amber" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-pixel text-amber uppercase tracking-widest">
                        🎧 REPRODUTOR DE ÁUDIO INTEGRADO
                      </span>
                      <h3 className="text-sm font-bold text-white max-w-md line-clamp-1">
                        {mediaTitle}
                      </h3>
                    </div>
                    <audio controls autoPlay src={playerSrc} className="w-full max-w-md rounded">
                      Seu navegador não suporta o áudio nativo.
                    </audio>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || downloading}
                  className="flex-1 bg-signal hover:bg-signal/90 text-white font-bold text-sm py-3 px-6 rounded-sm bevel-card flex items-center justify-center gap-2 shadow-bevel-btn uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading || downloading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>⏳ BAIXANDO...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>⬇️ BAIXAR {format.resolution || format.quality} AGORA</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* TAB 2: OPTION B (TRIMMING) */}
          {activeTab === 'trim' && (
            <div className="bg-surface p-4 rounded-sm bevel-inset space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-carbon uppercase border-b border-gray-300 pb-2">
                <Scissors className="w-4 h-4 text-signal" />
                <span>RECORTAR TRECHO DE ÁUDIO OU VÍDEO</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-chrome-indigo uppercase">Início (Segundos):</label>
                  <input
                    type="number"
                    min="0"
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="w-full bg-platinum p-2 rounded border border-chrome-indigo text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-chrome-indigo uppercase">Fim (Segundos):</label>
                  <input
                    type="number"
                    min="1"
                    value={endTime}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                    className="w-full bg-platinum p-2 rounded border border-chrome-indigo text-xs font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleTrimDownload}
                disabled={downloading}
                className="w-full bg-amber hover:bg-amber/90 text-carbon font-bold text-xs py-3 rounded-sm bevel-card flex items-center justify-center gap-2 shadow-bevel-btn uppercase"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>CORTANDO FFmpeg...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>✂️ CORTAR & BAIXAR SNIPPET ({endTime - startTime}s)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: OPTION C (HD COVERS & SUBTITLES) */}
          {activeTab === 'extras' && (
            <div className="bg-surface p-4 rounded-sm bevel-inset space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-carbon uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber" />
                  <span>Capa em Alta Resolução (Thumbnail 4K)</span>
                </h4>
                <div className="flex items-center gap-3">
                  <img
                    src={maxresThumbnail || thumbnail}
                    alt="Thumbnail HD"
                    className="w-24 h-16 object-cover rounded border border-chrome-indigo"
                  />
                  <a
                    href={maxresThumbnail || thumbnail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber text-carbon font-bold text-xs px-3 py-2 rounded-sm bevel-card shadow-bevel-btn inline-flex items-center gap-1 uppercase"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Capa 4K</span>
                  </a>
                </div>
              </div>

              {subtitles.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-300">
                  <h4 className="text-xs font-bold text-carbon uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-signal" />
                    <span>Legendas Disponíveis (.srt / .vtt)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subtitles.map((sub, idx) => (
                      <a
                        key={idx}
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-carbon text-white text-[11px] font-bold px-2.5 py-1 rounded bevel-card flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-amber" />
                        <span>{sub.language} ({sub.ext.toUpperCase()})</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
