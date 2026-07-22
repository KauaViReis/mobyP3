import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Video, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  Zap,
  ListMusic,
  Volume2,
  VolumeX,
  HelpCircle
} from 'lucide-react';

import BootScreen from './components/BootScreen';
import MobyMascot, { MobyState } from './components/MobyMascot';
import UrlInputGroup from './components/UrlInputGroup';
import MediaPreviewCard from './components/MediaPreviewCard';
import DownloadColumn, { FormatItem } from './components/DownloadColumn';
import ModalPreview from './components/ModalPreview';
import PlaylistBatchPanel, { PlaylistItem } from './components/PlaylistBatchPanel';
import MemoryCardPanel, { HistoryBlock } from './components/MemoryCardPanel';
import InstructionBookletModal from './components/InstructionBookletModal';
import RpgToast from './components/RpgToast';

import { useSFX } from './hooks/useSFX';

interface MediaInfo {
  is_playlist?: boolean;
  playlist_title?: string;
  playlist_items?: PlaylistItem[];
  id?: string;
  title?: string;
  thumbnail?: string;
  maxres_thumbnail?: string;
  duration?: string;
  uploader?: string;
  audio_formats?: FormatItem[];
  video_formats?: FormatItem[];
  subtitles?: { language: string; ext: string; url: string }[];
  preview_video_url?: string;
  webpage_url?: string;
  audio_preview_url?: string;
}

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://mobyp3-backend.onrender.com';
  }
  return 'http://127.0.0.1:8000';
};

const BACKEND_URL = getBackendUrl();

export default function App() {
  const { sfxEnabled, toggleSFX, playClick, playSuccess, playError, playLoadingSound } = useSFX();

  const [booting, setBooting] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mobyState, setMobyState] = useState<MobyState>('sleeping');
  const [mobySpeech, setMobySpeech] = useState<string | undefined>(undefined);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Tutorial Modal State
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Memory Card History State
  const [history, setHistory] = useState<HistoryBlock[]>([]);

  // Selected format for ModalPreview
  const [selectedFormat, setSelectedFormat] = useState<FormatItem | null>(null);
  const [backendStatus, setBackendStatus] = useState<'ready' | 'offline'>('offline');

  useEffect(() => {
    checkHealth();
    const savedHistory = localStorage.getItem('mobyp3_memory_card');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore
      }
    }
  }, []);

  const saveToMemoryCard = (item: { title: string; url: string; platform?: string }) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.url !== item.url);
      const updated = [
        { id: Date.now(), title: item.title, url: item.url, platform: item.platform || 'MIDIA' },
        ...filtered
      ].slice(0, 15);
      
      localStorage.setItem('mobyp3_memory_card', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: number | string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('mobyp3_memory_card', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mobyp3_memory_card');
  };

  const checkHealth = async (retries = 2): Promise<boolean> => {
    const isRemoteBackend = BACKEND_URL.startsWith('https://') || (!BACKEND_URL.includes('localhost') && !BACKEND_URL.includes('127.0.0.1'));
    const healthTimeout = isRemoteBackend ? 60000 : 8000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(healthTimeout) });
        if (res.ok) {
          setBackendStatus('ready');
          setMobyState('sleeping');
          setMobySpeech('Motor v3.0 Pro Pronto! Cole a URL ou recarregue do Memory Card.');
          return true;
        }
      } catch {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    }
    setBackendStatus('offline');
    setMobyState('sleeping');
    setMobySpeech('Servidor em standby. Reconectando automaticamente...');
    return false;
  };

  const handleFetchMedia = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClick();
    if (!urlInput.trim()) {
      playError();
      return;
    }

    setLoading(true);
    playLoadingSound();
    setErrorMsg(null);
    setMediaInfo(null);
    setMobyState('searching');
    setMobySpeech('Escaneando link (verificando se é vídeo individual ou playlist)...');

    try {
      // Se backend offline, tenta acordar antes de buscar mídia
      if (backendStatus === 'offline') {
        setMobySpeech('Acordando o servidor... Aguarde um momento.');
        const woke = await checkHealth(1);
        if (!woke) {
          throw new Error('Servidor indisponível. Tente novamente em alguns segundos.');
        }
      }

      const res = await fetch(`${BACKEND_URL}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Não foi possível extrair a mídia solicitada.');
      }

      const data: MediaInfo = await res.json();
      setMediaInfo(data);
      setMobyState('ready');
      playSuccess();

      if (data.is_playlist) {
        setMobySpeech(`Playlist "${data.playlist_title}" carregada com ${data.playlist_items?.length} faixas!`);
        setToastMsg(`Playlist com ${data.playlist_items?.length} faixas reconhecida!`);
        saveToMemoryCard({ title: data.playlist_title || 'Playlist', url: urlInput, platform: 'PLAYLIST' });
      } else {
        setMobySpeech('Mídia e resoluções HD/4K localizadas com sucesso!');
        setToastMsg(`Mídia extraída com sucesso!`);
        saveToMemoryCard({ title: data.title || 'Mídia Processada', url: urlInput, platform: 'YOUTUBE' });
      }
    } catch (err: any) {
      playError();
      const message = err.message || 'Erro ao conectar com a Moby Engine.';
      setErrorMsg(message);
      setMobyState('error');
      setMobySpeech(message.includes('indisponível')
        ? 'Servidor está acordando... Tente novamente em instantes!'
        : 'Acho que essa URL está incorreta ou o conteúdo é privado.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {booting && (
        <BootScreen
          backendUrl={BACKEND_URL}
          onBootComplete={() => setBooting(false)}
        />
      )}

      <div className="min-h-screen bg-canvas pb-16 pt-2 font-sans selection:bg-signal selection:text-white">
        
        {/* RETRO FLOATING QUEST ICON [ ! ] */}
        <button
          onClick={() => { playClick(); setShowTutorialModal(true); }}
          className="fixed bottom-5 left-5 z-40 bg-amber hover:bg-signal text-carbon hover:text-white w-12 h-12 rounded-full bevel-card flex items-center justify-center font-pixel font-bold text-xl shadow-[0_0_15px_rgba(236,171,55,0.6)] animate-bounce border-2 border-carbon transition-transform hover:scale-110 active:translate-y-0.5 group"
          title="Manual do Sistema & Guia [ ! ]"
        >
          <span>!</span>
          {/* Tooltip Tag */}
          <span className="absolute left-14 bg-carbon text-amber text-[10px] font-pixel px-2.5 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-amber">
            MANUAL DO SISTEMA [!]
          </span>
        </button>

        {/* MASTHEAD & MASCOT */}
        <header className="max-w-[840px] mx-auto px-3 mb-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <MobyMascot state={mobyState} customMsg={mobySpeech} />

            <div className="bg-carbon text-surface px-3 py-1.5 rounded bevel-card text-right flex flex-col justify-center border-l-4 border-l-signal">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
                <span>STATUS ENGINE:</span>
                {backendStatus === 'ready' ? (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                ) : (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber"></span>
                )}
              </div>
              <div className="text-xs font-bold font-pixel tracking-tight text-white flex items-center gap-1 justify-end">
                {backendStatus === 'ready' ? (
                  <span className="text-green-400">🟢 Motor v3.0 Pro</span>
                ) : (
                  <button onClick={() => { playClick(); checkHealth(); }} className="text-amber hover:text-white flex items-center gap-1 text-[10px]">
                    <span>🟡 Modo Pro Demo</span>
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CARBON COMMAND BAR */}
        <nav className="max-w-[840px] mx-auto mb-4 bg-halftone rounded-sm bevel-chassis p-2 flex flex-wrap items-center justify-between gap-2 shadow-hard-drop">
          <div className="bg-surface text-primary px-4 py-1 rounded-full font-display font-black text-xl tracking-tighter border-2 border-primary shadow-inner flex items-center gap-1">
            <span className="text-chrome-indigo">moby</span>
            <span className="text-primary italic">P3</span>
            <span className="text-[9px] bg-amber text-carbon px-1.5 py-0.5 rounded-full font-sans tracking-normal ml-1 border border-carbon font-bold">v3.0 PRO</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold uppercase">
            <a href="#chassis" onClick={playClick} className="text-nav-gold hover:text-amber transition-colors flex items-center gap-1">
              <Music className="w-3.5 h-3.5" /> Áudio
            </a>
            <a href="#chassis" onClick={playClick} className="text-nav-gold hover:text-amber transition-colors flex items-center gap-1">
              <Video className="w-3.5 h-3.5" /> Vídeo 4K
            </a>
            <a href="#chassis" onClick={playClick} className="text-nav-gold hover:text-amber transition-colors flex items-center gap-1">
              <ListMusic className="w-3.5 h-3.5" /> Playlists
            </a>

            {/* MANUAL BUTTON */}
            <button
              onClick={() => { playClick(); setShowTutorialModal(true); }}
              className="text-amber hover:text-white transition-colors flex items-center gap-1 font-pixel text-[10px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>GUIA [ ! ]</span>
            </button>

            {/* 8-BIT SFX TOGGLE BUTTON */}
            <button
              onClick={() => { toggleSFX(); playClick(); }}
              className={`text-[10px] font-pixel px-2 py-1 rounded border border-black shadow-[1px_1px_0px_#000] active:translate-y-0.5 flex items-center gap-1 ${
                sfxEnabled ? 'bg-amber text-carbon' : 'bg-gray-700 text-gray-300'
              }`}
              title="Ativar/Desativar Efeitos Sonoros 8-Bit"
            >
              {sfxEnabled ? <Volume2 className="w-3 h-3 text-carbon" /> : <VolumeX className="w-3 h-3" />}
              <span>{sfxEnabled ? 'SFX: ON' : 'SFX: OFF'}</span>
            </button>
          </div>
        </nav>

        {/* MAIN BODY */}
        <main id="chassis" className="max-w-[840px] mx-auto px-1 space-y-6">
          
          <div className="bg-periwinkle p-4 sm:p-6 rounded-md bevel-chassis shadow-hard-drop">
            <div className="flex items-center justify-between mb-3 border-b-2 border-chrome-indigo pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-signal rounded-full border border-carbon"></span>
                <h1 className="text-sm font-bold text-carbon uppercase tracking-wider font-sans">
                  ≡ PAINEL DE COMANDO PRO v3.0
                </h1>
              </div>
              <span className="text-[11px] font-bold text-chrome-indigo bg-canvas-soft px-2 py-0.5 rounded border border-chrome-indigo font-pixel">
                BRUH LTDA ENGINE PRO
              </span>
            </div>

            <UrlInputGroup
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              onSubmit={handleFetchMedia}
              loading={loading}
            />

            <div className="mt-4 pt-3 border-t border-chrome-indigo/30 flex flex-wrap items-center justify-between text-[11px] text-chrome-indigo font-bold">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-signal" /> Playlists, Recorte de Áudio/Vídeo, Capas 4K & Legendas
              </span>
              <button
                onClick={() => { playClick(); setShowTutorialModal(true); }}
                className="text-signal hover:underline flex items-center gap-1 font-pixel text-[10px]"
              >
                <span>Ver Manual de Instruções [!]</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-100 border-2 border-primary text-primary p-3 rounded-sm bevel-card flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PLAYLIST BATCH DISPLAY */}
          {mediaInfo && mediaInfo.is_playlist && mediaInfo.playlist_items && (
            <PlaylistBatchPanel
              playlistTitle={mediaInfo.playlist_title || "Playlist Selecionada"}
              items={mediaInfo.playlist_items}
              onTriggerToast={(msg) => setToastMsg(msg)}
            />
          )}

          {/* SINGLE MEDIA DISPLAY */}
          {mediaInfo && !mediaInfo.is_playlist && mediaInfo.title && (
            <div className="bg-surface rounded-md bevel-chassis p-4 sm:p-6 shadow-hard-drop space-y-6">
              <MediaPreviewCard media={{
                title: mediaInfo.title,
                thumbnail: mediaInfo.thumbnail || '',
                duration: mediaInfo.duration || '00:00',
                uploader: mediaInfo.uploader || 'Desconhecido',
                webpage_url: mediaInfo.webpage_url || urlInput,
                audio_preview_url: mediaInfo.audio_preview_url
              }} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DownloadColumn
                  title="🎵 Áudio Extraído (MP3 / M4A)"
                  type="audio"
                  badgeText="Sem Vírus"
                  formats={mediaInfo.audio_formats || []}
                  onSelectFormat={(fmt) => { playClick(); setSelectedFormat(fmt); }}
                />

                <DownloadColumn
                  title="🎬 Vídeo HD / 4K (Com Som)"
                  type="video"
                  badgeText="360p até 4K"
                  formats={mediaInfo.video_formats || []}
                  onSelectFormat={(fmt) => { playClick(); setSelectedFormat(fmt); }}
                />
              </div>
            </div>
          )}

          {/* MEMORY CARD PANEL */}
          <MemoryCardPanel
            history={history}
            onLoadUrl={(url) => { playClick(); setUrlInput(url); }}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
            playClick={playClick}
          />

          {/* FOOTER */}
          <footer className="bg-halftone text-surface p-4 rounded-sm bevel-chassis text-center space-y-2 shadow-hard-drop">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 pb-2 text-[11px] text-gray-400 font-bold uppercase">
              <span>LICENSED BY BRUH LTDA</span>
              <div className="flex items-center gap-2">
                <span className="bg-amber text-carbon px-1.5 py-0.5 rounded text-[9px] font-pixel">ESRB — PRIVACY CERTIFIED</span>
                <span className="text-green-400">SAFE & CLEAN GUARANTEE</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              © 2001-2026 BRUH ENTERTAINMENT CO. ALL RIGHTS RESERVED. mobyP3 é um utilitário aberto sem fins lucrativos.
            </p>
          </footer>

        </main>

        {/* INSTRUCTION BOOKLET / TUTORIAL MODAL [ ! ] */}
        {showTutorialModal && (
          <InstructionBookletModal
            onClose={() => setShowTutorialModal(false)}
            playClick={playClick}
          />
        )}

        {/* MODAL PREVIEW */}
        {selectedFormat && mediaInfo && (
          <ModalPreview
            mediaTitle={mediaInfo.title || 'Mídia'}
            thumbnail={mediaInfo.thumbnail || ''}
            maxresThumbnail={mediaInfo.maxres_thumbnail}
            previewVideoUrl={mediaInfo.preview_video_url}
            webpageUrl={mediaInfo.webpage_url || urlInput}
            format={selectedFormat}
            subtitles={mediaInfo.subtitles}
            backendUrl={BACKEND_URL}
            onClose={() => { playClick(); setSelectedFormat(null); }}
            onTriggerToast={(msg) => setToastMsg(msg)}
          />
        )}

        {/* RPG TOAST */}
        {toastMsg && (
          <RpgToast message={toastMsg} onClose={() => setToastMsg(null)} />
        )}
      </div>
    </>
  );
}
