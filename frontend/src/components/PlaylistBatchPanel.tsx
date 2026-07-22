import React, { useState } from 'react';
import { ListMusic, CheckSquare, Square, Download, RefreshCw, Music } from 'lucide-react';

export interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploader: string;
  webpage_url: string;
}

interface PlaylistBatchPanelProps {
  playlistTitle: string;
  items: PlaylistItem[];
  onTriggerToast: (msg: string) => void;
}

export default function PlaylistBatchPanel({ playlistTitle, items, onTriggerToast }: PlaylistBatchPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(items.map(i => i.id));
  const [downloading, setDownloading] = useState(false);
  const [currentDownloadIndex, setCurrentDownloadIndex] = useState(0);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchDownload = async () => {
    if (selectedIds.length === 0) {
      onTriggerToast("Selecione ao menos 1 faixa para baixar.");
      return;
    }

    setDownloading(true);
    const selectedItems = items.filter(item => selectedIds.includes(item.id));

    for (let i = 0; i < selectedItems.length; i++) {
      setCurrentDownloadIndex(i + 1);
      const item = selectedItems[i];
      onTriggerToast(`Baixando [${i + 1}/${selectedItems.length}]: ${item.title.substring(0, 25)}...`);
      
      // Simulate download interval
      await new Promise(r => setTimeout(r, 1200));
    }

    setDownloading(false);
    onTriggerToast(`Batch de ${selectedItems.length} faixas concluído!`);
  };

  return (
    <div className="bg-periwinkle p-4 sm:p-6 rounded-md bevel-chassis shadow-hard-drop space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-chrome-indigo pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-signal text-white flex items-center justify-center shadow-md">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-carbon uppercase tracking-wider">
              {playlistTitle}
            </h2>
            <span className="text-[10px] text-chrome-indigo font-bold font-pixel">
              PLAYLIST RECONHECIDA ({items.length} FAIXAS DETECTADAS)
            </span>
          </div>
        </div>

        <button
          onClick={toggleSelectAll}
          className="bg-surface hover:bg-gray-100 text-carbon font-bold text-xs px-3 py-1.5 rounded-sm bevel-card flex items-center gap-1.5 shadow-bevel-btn"
        >
          {selectedIds.length === items.length ? <CheckSquare className="w-4 h-4 text-signal" /> : <Square className="w-4 h-4 text-gray-500" />}
          <span>{selectedIds.length === items.length ? 'Desmarcar Todos' : 'Marcar Todos'}</span>
        </button>
      </div>

      {/* Playlist Items Grid / List */}
      <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {items.map((item, idx) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelectItem(item.id)}
              className={`p-2.5 rounded-sm bevel-inset flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-surface border-l-4 border-l-signal' : 'bg-platinum/80 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button type="button" className="text-signal">
                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                </button>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-12 h-9 object-cover rounded-xs border border-chrome-indigo flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-carbon truncate">
                    {idx + 1}. {item.title}
                  </h4>
                  <p className="text-[10px] text-chrome-indigo font-medium">
                    {item.uploader} • {item.duration}
                  </p>
                </div>
              </div>

              <span className="text-[9px] bg-amber text-carbon px-2 py-0.5 rounded font-pixel flex-shrink-0">
                MP3 320k
              </span>
            </div>
          );
        })}
      </div>

      {/* Batch Download CTA Button */}
      <div className="pt-2 border-t border-chrome-indigo/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-carbon">
          SELECIONADOS: <span className="text-signal font-black">{selectedIds.length}</span> DE {items.length} ITENS
        </span>

        <button
          onClick={handleBatchDownload}
          disabled={downloading || selectedIds.length === 0}
          className="w-full sm:w-auto bg-signal hover:bg-signal/90 text-white font-bold text-xs px-6 py-2.5 rounded-sm bevel-card flex items-center justify-center gap-2 shadow-bevel-btn uppercase tracking-wider disabled:opacity-50"
        >
          {downloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>BAIXANDO BATCH [{currentDownloadIndex}/{selectedIds.length}]...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>⬇️ BAIXAR SELECIONADOS ({selectedIds.length})</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
