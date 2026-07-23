import React, { useEffect, useState } from 'react';
import { Clipboard, Check, ChevronRight, RefreshCw, Disc } from 'lucide-react';

interface UrlInputGroupProps {
  urlInput: string;
  setUrlInput: (url: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
}

export default function UrlInputGroup({ urlInput, setUrlInput, onSubmit, loading }: UrlInputGroupProps) {
  const [copied, setCopied] = useState(false);
  const [clipboardDetected, setClipboardDetected] = useState<string | null>(null);

  // Platform auto-detection
  const detectPlatform = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return { name: 'YOUTUBE', color: 'bg-red-600 text-white' };
    }
    if (lower.includes('tiktok.com')) {
      return { name: 'TIKTOK', color: 'bg-black text-cyan-400 border border-cyan-400' };
    }
    if (lower.includes('soundcloud.com')) {
      return { name: 'SOUNDCLOUD', color: 'bg-orange-600 text-white' };
    }
    if (lower.includes('instagram.com')) {
      return { name: 'INSTAGRAM', color: 'bg-pink-600 text-white' };
    }
    if (url.trim().length > 5) {
      return { name: 'WEB MEDIA', color: 'bg-chrome-indigo text-white' };
    }
    return null;
  };

  const platformBadge = detectPlatform(urlInput);

  // Check clipboard on load / focus
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && (text.startsWith('http://') || text.startsWith('https://')) && text !== urlInput) {
            setClipboardDetected(text);
          }
        }
      } catch {
        // Permission denied or not focused
      }
    };
    checkClipboard();
  }, [urlInput]);

  const handlePaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text.trim());
          setCopied(true);
          setClipboardDetected(null);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      }
    } catch {
      // Browser permission fallback prompt
    }
    // Fallback if clipboard API permission is denied
    const manualText = prompt("Cole a URL do vídeo ou áudio aqui:");
    if (manualText) {
      setUrlInput(manualText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3 max-w-full overflow-x-hidden">
      {/* Floating Clipboard Notice Banner */}
      {clipboardDetected && (
        <div className="bg-carbon text-amber p-2.5 rounded-sm bevel-card text-xs font-bold flex flex-wrap items-center justify-between gap-2 border-l-4 border-l-signal shadow-hard-drop">
          <span className="flex items-center gap-1.5 font-pixel text-[10px] truncate max-w-[280px] sm:max-w-md">
            💡 Link detectado: <span className="text-white underline truncate">{clipboardDetected}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setUrlInput(clipboardDetected);
              setClipboardDetected(null);
            }}
            className="min-h-[36px] bg-signal text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-signal/90 uppercase tracking-wider bevel-card active:translate-y-0.5"
          >
            COLAR AUTO ➔
          </button>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-carbon uppercase tracking-wider flex items-center gap-1.5">
            <span>URL da Mídia:</span>
            {platformBadge && (
              <span className={`text-[9px] font-pixel px-2 py-0.5 rounded shadow-sm ${platformBadge.color}`}>
                [ {platformBadge.name} ]
              </span>
            )}
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Input Field with Inset Bevel */}
          <div className="relative flex-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Cole a URL do YouTube, TikTok, Soundcloud ou Instagram..."
              className="w-full min-h-[48px] bg-surface text-carbon px-3.5 py-2.5 rounded-sm bevel-inset text-sm font-medium focus:outline-none focus:ring-2 focus:ring-signal placeholder:text-gray-400"
              required
            />
          </div>

          {/* Retro Auto-Paste Button ("LER DISCO") - Min 48px touch target */}
          <button
            type="button"
            onClick={handlePaste}
            className="min-h-[48px] bg-amber hover:bg-amber/90 active:translate-y-0.5 text-carbon px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bevel-card flex items-center justify-center gap-2 shadow-bevel-btn"
            title="Auto-Colar da Área de Transferência (1 Toque)"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-800" />
                <span>DISCO LIDO!</span>
              </>
            ) : (
              <>
                <Disc className="w-4 h-4 text-carbon animate-spin-slow" />
                <span>LER DISCO</span>
              </>
            )}
          </button>

          {/* Submit CTA Button - Min 48px touch target */}
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] bg-signal hover:bg-signal/90 active:translate-y-0.5 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bevel-card flex items-center justify-center gap-2 shadow-bevel-btn disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ESCANEANDO...</span>
              </>
            ) : (
              <>
                <span>BUSCAR MÍDIA</span>
                <ChevronRight className="w-4 h-4 bg-white text-signal rounded-full p-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
