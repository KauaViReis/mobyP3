import React, { useEffect, useState } from 'react';
import { Clipboard, Check, ChevronRight, RefreshCw, Zap } from 'lucide-react';

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

  // Check clipboard on focus
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.startsWith('http') && text !== urlInput) {
            setClipboardDetected(text);
          }
        }
      } catch {
        // Silent catch if permissions not granted
      }
    };
    checkClipboard();
  }, [urlInput]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        setCopied(true);
        setClipboardDetected(null);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-3">
      {/* Floating Clipboard Toast Notice */}
      {clipboardDetected && (
        <div className="bg-carbon text-amber px-3 py-1.5 rounded-sm bevel-card text-xs font-bold flex items-center justify-between animate-bounce border-l-4 border-l-signal shadow-hard-drop">
          <span className="flex items-center gap-1.5 font-pixel text-[10px]">
            💡 Link detectado na Área de Transferência!
          </span>
          <button
            onClick={() => {
              setUrlInput(clipboardDetected);
              setClipboardDetected(null);
            }}
            className="bg-signal text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-signal/90 uppercase"
          >
            Colar Auto ➔
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
              className="w-full bg-surface text-carbon px-3 py-2.5 rounded-sm bevel-inset text-sm font-medium focus:outline-none focus:ring-2 focus:ring-signal placeholder:text-gray-400"
              required
            />
          </div>

          {/* Paste Button (Amber) */}
          <button
            type="button"
            onClick={handlePaste}
            className="bg-amber hover:bg-amber/90 active:translate-y-0.5 text-carbon px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bevel-card flex items-center justify-center gap-1.5 shadow-bevel-btn"
          >
            {copied ? <Check className="w-4 h-4 text-green-800" /> : <Clipboard className="w-4 h-4" />}
            <span>{copied ? 'Colado!' : 'Colar Link'}</span>
          </button>

          {/* Submit CTA Button (Signal Orange) */}
          <button
            type="submit"
            disabled={loading}
            className="bg-signal hover:bg-signal/90 active:translate-y-0.5 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bevel-card flex items-center justify-center gap-2 shadow-bevel-btn disabled:opacity-50"
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
