import React, { useEffect, useState } from 'react';

interface RpgToastProps {
  message: string;
  onClose: () => void;
}

export default function RpgToast({ message, onClose }: RpgToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-carbon text-white p-3 rounded border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.8)] font-mono text-xs animate-bounce">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="text-[10px] font-pixel text-amber tracking-wider uppercase flex items-center gap-1">
            <span>❖ NOTIFICAÇÃO RPG</span>
          </div>
          <p className="text-gray-200 leading-snug font-sans text-xs">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white font-bold px-1 text-xs"
        >
          ✕
        </button>
      </div>
      {/* Blinking RPG Cursor */}
      <div className="text-right mt-1">
        <span className="inline-block w-2 h-3 bg-signal animate-pulse">▼</span>
      </div>
    </div>
  );
}
